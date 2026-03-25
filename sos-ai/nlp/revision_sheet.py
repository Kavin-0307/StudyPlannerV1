def revision_sheet(keywords,summary,important_points):
    keywords_str=", ".join(keywords)
    points_str="\n".join([f"-{point}"for point in important_points])
    sheet=f"""
REVISION SHEET
----------------------------
Keywords:
{keywords_str}

Summary:
{summary}

Important Points:
{points_str}
----------------------------
    """
    return sheet.strip()