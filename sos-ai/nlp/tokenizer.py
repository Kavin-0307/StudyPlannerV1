import re
from nltk.tokenize import word_tokenize

def tokenizer(sentences):
    tokens=[]
    for sentence in sentences:
        words=word_tokenize(sentence)
        tokens.extend(words)
    return tokens