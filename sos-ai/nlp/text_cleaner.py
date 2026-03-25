import re
def text_cleaner(extractedText):
    
    extractedText=extractedText.lower()
    extractedText=remove_newlines(extractedText)
    extractedText=remove_special_characters(extractedText)
    extractedText=remove_extra_whitespaces(extractedText)
    return extractedText
def remove_newlines(extractedText):
    return extractedText.replace("\n"," ")
def remove_special_characters(extractedText):
    return re.sub(r'[^a-zA-Z0-9\s.?!]','',extractedText)
def remove_extra_whitespaces(extractedText):
    extractedText=extractedText.strip()
    return " ".join(extractedText.split())
