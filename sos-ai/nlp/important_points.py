def important_points(sentence_scores,n):
    sorted_sentences=sorted(sentence_scores.items(),key=lambda x:x[1],reverse=True)
    top_points=[sentence for sentence,score in sorted_sentences[:n]]
    return top_points