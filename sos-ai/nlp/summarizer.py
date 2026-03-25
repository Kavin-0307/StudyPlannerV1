def summarizer(sentence_scores,n):
    sorted_sentences=sorted(sentence_scores.items(),key=lambda x:x[1],reverse=True)
    top_sentences=sorted_sentences[:n]
    summary_sentence=[ sentence for  sentence,score in top_sentences]
    summary=" ".join(summary_sentence)
    return summary