from collections import Counter
def word_frequency(tokens):
    freq=Counter(tokens)
    return dict(sorted(freq.items(),key=lambda x:x[1],reverse=True))