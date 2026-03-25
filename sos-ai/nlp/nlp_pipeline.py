from text_cleaner import text_cleaner
from sentence_splitter import sentence_splitter
from tokenizer import tokenizer
from stopword_remover import stopword_remover
from word_frequency import word_frequency
from keyword_extractor import keyword_extractor
from sentence_ranker import sentence_ranker
from summarizer import summarizer
from important_points import important_points
from revision_sheet import revision_sheet


def process_text(text):
    clean_text_data = text_cleaner(text)
    sentences = sentence_splitter(clean_text_data)
    tokens = tokenizer(sentences)
    filtered_tokens = stopword_remover(tokens)
    frequency = word_frequency(filtered_tokens)
    keywords = keyword_extractor(frequency, 10)
    sentence_scores = sentence_ranker(sentences, frequency)
    summary = summarizer(sentence_scores, 3)
    points = important_points(sentence_scores, 5)
    sheet = revision_sheet(keywords, summary, points)

    return {
        "keywords": keywords,
        "summary": summary,
        "important_points": points,
        "revision_sheet": sheet
    }