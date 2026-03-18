package com.Ajwain.SOS.dto;

import java.time.LocalDateTime;

import com.Ajwain.SOS.entities.enums.DeadlineType;

public record DeadlineResponseDTO(
		Long id,
		String deadlineTitle,
		LocalDateTime deadlineDate,
		DeadlineType deadlineType,
		int deadlinePriority
		) {

}
