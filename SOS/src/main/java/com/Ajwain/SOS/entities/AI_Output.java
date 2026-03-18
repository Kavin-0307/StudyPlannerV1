package com.Ajwain.SOS.entities;

import java.time.LocalDateTime;

import com.Ajwain.SOS.entities.enums.OutputType;

import jakarta.persistence.*;

@Entity
@Table(name="ai_output")
public class AI_Output {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long id;
	
	@ManyToOne(fetch=FetchType.LAZY,optional=false)
	@JoinColumn(name="lecture_id",nullable=false)
	private Lecture lecture;
	
	@Enumerated(EnumType.STRING)
	@Column(name="output_type",nullable=false)
	private OutputType aiOutputType;
	
	@Lob
	@Column(name="content")
	private String outputContent;
	
	@Column(nullable = false, updatable = false)
	private LocalDateTime generatedAt;
	
	@PrePersist
	protected void onCreate() {
	    generatedAt = LocalDateTime.now();
	}
	
	public long getId() {
		return id;
	}
	
	public Lecture getLecture() {
		return lecture;
	}
	public void setLecture(Lecture lecture) {
		this.lecture=lecture;
	}
	
	public void setOutputType(OutputType aiOutputType) {
		this.aiOutputType=aiOutputType;
	}
	public OutputType getOutputType() {
		return aiOutputType;
	}
	
	public void setOutputContent(String outputContent) {
		this.outputContent=outputContent;
	}
	public String getOutputContent() {
		return outputContent;
	}
	
	public LocalDateTime getGeneratedAt() {
		return generatedAt;
	}
	public void setGeneratedAt(LocalDateTime generatedAt) {
		this.generatedAt=generatedAt;
	}
}
