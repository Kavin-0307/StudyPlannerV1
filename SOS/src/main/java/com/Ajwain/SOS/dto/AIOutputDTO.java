package com.Ajwain.SOS.dto;
import java.time.LocalDateTime;

public record AIOutputDTO(
    long id,
    long lectureId,
    String outputType,
    String outputContent,
    LocalDateTime generatedAt
) {}