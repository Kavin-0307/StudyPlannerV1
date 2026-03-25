package com.Ajwain.SOS.controllers;

import java.time.LocalDate;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Ajwain.SOS.dto.PaginationResponseDTO;
import com.Ajwain.SOS.dto.RevisionResponseDTO;
import com.Ajwain.SOS.dto.RevisionSearchCriteria;
import com.Ajwain.SOS.entities.enums.RevisionStatus;
import com.Ajwain.SOS.services.RevisionService;

@RestController
@RequestMapping("/api/revisions")
public class RevisionController {

    private final RevisionService revisionService;

    public RevisionController(RevisionService revisionService) {
        this.revisionService = revisionService;
    }

    // ================= SEARCH / FILTER =================
    @GetMapping
    public ResponseEntity<PaginationResponseDTO<RevisionResponseDTO>> getRevisions(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long lectureId,
            @RequestParam(required = false) RevisionStatus status,
            @RequestParam(required = false) Integer revisionNumber,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            Pageable pageable) {

        RevisionSearchCriteria criteria = new RevisionSearchCriteria();
        criteria.setUserId(userId);
        criteria.setLectureId(lectureId);
        criteria.setRevisionStatus(status);
        criteria.setRevisionNumber(revisionNumber);
        criteria.setFromDate(fromDate);
        criteria.setToDate(toDate);

        return ResponseEntity.ok(
                revisionService.getRevisions(criteria, pageable)
        );
    }

    // ================= MARK COMPLETE =================
    @PatchMapping("/{revisionId}/complete")
    public ResponseEntity<RevisionResponseDTO> markRevisionCompleted(
            @PathVariable Long revisionId) {

        return ResponseEntity.ok(
                revisionService.markRevisionCompleted(revisionId)
        );
    }
}