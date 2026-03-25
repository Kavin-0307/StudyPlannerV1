package com.Ajwain.SOS.dto;

import java.util.List;

public record AIResponseDTO(    List<String> keywords,
String summary,
List<String> important_points,
String revision_sheet
) {
	public String getSummary() {
		return summary;
	}
	public String getRevisionSheet() {
		return revision_sheet;
	}
	public List<String> getKeywords(){
		return keywords;
	}
	public List<String> getImportantPoints(){
		return important_points;
	}

}
