"""
- Capable of extracting from ONE WEBPAGE a structured sectioned list of URLs

TODOs
- LA PAGINATION ET AUTRES PAGES LIEES : explorer toutes les pages du même domaine qui sont liées
- Puis pour chaque section et chaque lien PDF, LLM doit dire si c'est un PDF lié à un conseil municipal, et si oui quelle est la date du conseil
"""

import bs4

TITLE_TAGS_TO_LEVEL = {
    "h1": 1,
    "h2": 2,
    "h3": 3,
    "h4": 4,
    "h5": 5,
    "h6": 6,
    "h7": 7,
    "h8": 8,
}

TAGS_TO_SKIP = set(["script", "style", "meta", "link", "header", "footer", "nav", "navbar"])

TYPE_TITLE = "title"
TYPE_TEXT = "text"
TYPE_LINK = "link"

def extract_chunks(bs: bs4.BeautifulSoup | bs4.element.Tag, index=None):
    """
    Recursively traverse the HTML soup through its "children".
    When there is a title, keep it, with the associated level.
    When there is a link, keep it.
    Always keep the full text.
    
    Then for each chunk of text or link, associate it with a section ID, which has a full title.

    Then group by section ID and keep only the ones that have at least one link.

    For each link
    - If it links to a ZIP, download the zip, extract it, keep the folder structure and treat that as sections, then list its PDFs per folder
    - If it links to a PDF, check its name, and only keep it if it is strictly related to a municipal council

    Children can be one of (probably not exhaustive):
    - bs4.element.Comment
    - bs4.element.Doctype
    - bs4.element.NavigableString
    - bs4.element.Script
    - bs4.element.Stylesheet,
    - bs4.element.Tag
    """
    if index is None:
        index = []

    chunks = []
    for child_idx, child in enumerate(bs.children):
        pos = index + [child_idx]
        if isinstance(child, bs4.element.NavigableString):
            stripped_text = child.get_text().strip()
            if stripped_text != "":
                chunks.append({
                    "type": TYPE_TEXT,
                    "text": stripped_text,
                    "pos": pos
                })
        elif isinstance(child, bs4.element.Tag) and child.name in TITLE_TAGS_TO_LEVEL:
            chunks.append({
                "type": TYPE_TITLE,
                "level": TITLE_TAGS_TO_LEVEL[child.name],
                "text": child.get_text(),
                "pos": pos
            })
        elif isinstance(child, bs4.element.Tag) and child.name in TAGS_TO_SKIP:
            continue
        elif isinstance(child, bs4.element.Tag) and child.name == "a":
            child_chunks = extract_chunks(child, pos)
            text = " ".join([c.get("text") for c in child_chunks])
            href = child.attrs.get("href", "")
            if href != "" and not href.startswith("javascript:") and not href.startswith("mailto:"):
                chunks.append({
                    "type": TYPE_LINK,
                    "link": href,
                    "pos": pos,
                    "text": text
                })
        elif isinstance(child, bs4.element.Tag):
            child_chunks = extract_chunks(child, pos)
            chunks.extend(child_chunks)
    return chunks


def build_new_section(current_section: list, title_level: int, title_text: str):
    new_section = []
    for level, text in current_section:
        if level < title_level:
            new_section.append((level, text))
    new_section.append((title_level, title_text))
    return new_section


def assign_section_to_chunk(chunks: list):
    section = []
    chunks_with_levels = []
    previous_text_context_within_section = []
    text_context = []
    for chunk in chunks:
        if chunk["type"] == TYPE_TITLE:
            new_section = build_new_section(section, chunk["level"], chunk["text"])
            text_context = []
            previous_text_context_within_section = []
            section = new_section
        elif chunk["type"] == TYPE_TEXT:
            text_context = text_context + [chunk["text"]]
        chunk["section"] = " // ".join([subtitle for _, subtitle in section])

        if chunk["type"] == TYPE_LINK:
            if len(text_context) > 0:
                previous_text_context_within_section = text_context
                chunk["context"] = " ".join(text_context)
                text_context = []
            elif len(text_context) == 0 and len(previous_text_context_within_section) > 0:
                chunk["context"] = " ".join(previous_text_context_within_section)
                text_context = []
            elif len(text_context) == 0 and len(previous_text_context_within_section) == 0:
                chunk["context"] = ""
            
            chunk["section_with_context"] = ", ".join([c for c in [chunk["section"], chunk["context"]] if c != ""])

        chunks_with_levels.append(chunk)
    return chunks_with_levels


def group_links(chunks: list, source_url: str):
    current_section_title = ""
    current_section_chunks = []
    sections = []
    for chunk in [c for c in chunks if c["type"] == TYPE_LINK]:
        if chunk["section_with_context"] != current_section_title and len(current_section_chunks) > 0:
            sections.append({"title": current_section_title, "chunks": current_section_chunks})
            current_section_title = chunk["section_with_context"]
            current_section_chunks = []
        
        current_section_chunks.append({
            "link": chunk["link"],
            "text": chunk["text"],
            "context": chunk["context"]
        })
    
    if len(current_section_chunks) > 0:
        sections.append({"source_url": source_url, "title": current_section_title, "chunks": current_section_chunks})
    return sections


def pipeline(html_content: str, source_url):
    bs = bs4.BeautifulSoup(html_content, "html.parser")
    chunks = extract_chunks(bs)
    chunks_with_sections = assign_section_to_chunk(chunks)
    return group_links(chunks_with_sections, source_url)


def display_section_outputs(sections):
    for section in sections:
        print(f"<new_section> {section['title']}")
        for chunk in section["chunks"]:
            print(f"- {chunk['text']} => {chunk['link']}")
        print("")


