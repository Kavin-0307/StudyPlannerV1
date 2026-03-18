package com.Ajwain.SOS.dto;

import com.Ajwain.SOS.entities.enums.SubjectTag;

public record SubjectResponseDTO(
		Long id,
		String subjectName,
		int subjectPriority,
		SubjectTag subjectTag) {

}
