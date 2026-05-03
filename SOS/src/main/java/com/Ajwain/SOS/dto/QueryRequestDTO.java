package com.Ajwain.SOS.dto;

/**
 * DTO for the AI query endpoint POST /api/ai-output/query.
 * Replaces the brittle @RequestBody String pattern.
 * lectureId is used to reconstruct the session_id ("lecture_" + lectureId)
 * that was used when the lecture was indexed.
 */
public record QueryRequestDTO(String question, Long lectureId) {}
