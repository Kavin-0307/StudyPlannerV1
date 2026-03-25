package com.Ajwain.SOS.dto;

import java.time.LocalDate;

public record LectureResponseDTO(
        Long id,
        Long subjectId,
        String filePath,
        boolean processed,
        LocalDate uploadDate
        ,String lectureText
) {}