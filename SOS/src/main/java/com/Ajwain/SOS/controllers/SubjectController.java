package com.Ajwain.SOS.controllers;

import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.dto.SubjectRequestDTO;
import com.Ajwain.SOS.dto.SubjectResponseDTO;
import com.Ajwain.SOS.services.SubjectService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    // CREATE — userId now comes from the JWT, not the URL
    @PostMapping
    public ResponseEntity<SubjectResponseDTO> createSubject(
            @Valid @RequestBody SubjectRequestDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectService.createSubject(dto));
    }

    // UPDATE
    @PutMapping("/{subjectId}")
    public ResponseEntity<SubjectResponseDTO> updateSubject(
            @PathVariable Long subjectId,
            @Valid @RequestBody SubjectRequestDTO dto) {

        return ResponseEntity.ok(subjectService.updateSubject(subjectId, dto));
    }

    // GET — userId now comes from the JWT, not a query param
    @GetMapping
    public PaginationResponseDTO<SubjectResponseDTO> getSubjects(Pageable pageable) {
        return subjectService.getSubjects(pageable);
    }

    // DELETE
    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long subjectId) {
        subjectService.deleteSubject(subjectId);
        return ResponseEntity.noContent().build();
    }

    // SEARCH — scoped to the current user
    @GetMapping("/search")
    public ResponseEntity<PaginationResponseDTO<SubjectResponseDTO>> searchSubjects(
            @RequestParam String keyword,
            Pageable pageable) {

        return ResponseEntity.ok(subjectService.searchSubjects(keyword, pageable));
    }
}