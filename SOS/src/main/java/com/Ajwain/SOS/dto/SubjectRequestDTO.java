package com.Ajwain.SOS.dto;

import com.Ajwain.SOS.entities.enums.SubjectTag;

import jakarta.validation.constraints.*;

public class SubjectRequestDTO {
	@NotBlank
	private String subjectName;
	@Positive
	private int subjectPriority;
	@NotNull
	private SubjectTag subjectTag;
	
	public void setSubjectName(String subjectName) {
		this.subjectName=subjectName;
	}
	public String getSubjectName() {
		return subjectName;
	}
	public void setSubjectPriority(int subjectPriority) {
		this.subjectPriority=subjectPriority;
	}
	public int getSubjectPriority() {
		return subjectPriority;
	}
	public SubjectTag getSubjectTag() {
		return subjectTag;
	}
	public void setSubjectTag(SubjectTag subjectTag) {
		this.subjectTag=subjectTag;
	}
	
}
