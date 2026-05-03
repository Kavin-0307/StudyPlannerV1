package com.Ajwain.SOS.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AIResponseDTO(
    List<String> keywords,
    String summary,
    @JsonProperty("important_points") List<String> importantPoints,
    @JsonProperty("revision_sheet")   String revisionSheet
) {}