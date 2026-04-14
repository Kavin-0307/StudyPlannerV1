package com.Ajwain.SOS.dto;

import java.time.LocalDate;	

import com.Ajwain.SOS.entities.enums.StudyStatus;

public record StudyPlanResponseDTO(
        Long id,
        Long userId,
        Long subjectId,
        LocalDate studyDate,
        int durationMinutes,
        StudyStatus status
) {}