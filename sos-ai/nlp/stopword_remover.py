from nltk.corpus import stopwords
import string
def stopword_remover(tokens):
    stop_words = set(stopwords.words('english'))
   
    filtered_tokens = [word for word in tokens 
                       if word not in stop_words
                       and word not in string.punctuation
                       and word.isalpha()
                       and len(word)>2]
    
    return filtered_tokens