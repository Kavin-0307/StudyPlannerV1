import re 
def sentence_splitter(extractedText):
    sentences=re.split(r'(?<=[.?|])\s+',extractedText)
    sentences=[s.strip() for s in sentences if s.strip()]
    fsentences=[s for s in sentences if(len(s.split())>2)]
    return sentences