package com.Ajwain.SOS.dto;

import jakarta.validation.constraints.NotBlank;;

public class AIRequestDTO {
    @NotBlank
    private String text;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}