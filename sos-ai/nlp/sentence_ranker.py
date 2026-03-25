def sentence_ranker(sentences,frequency):
    sentence_scores={}
    for sentence in sentences:
        totalScore=0
        words=sentence.lower().split()

        for word in words:
            if word in frequency:
                totalScore+=frequency[word]
        if(len(words)>0):
            sentence_scores[sentence]=totalScore/len(words)
    return sentence_scores
