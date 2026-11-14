package com.campusconnect.request.controller;

import com.campusconnect.request.dto.LostFoundDto;
import com.campusconnect.request.entity.ItemType;
import com.campusconnect.request.entity.LostFoundStatus;
import com.campusconnect.request.security.UserContext;
import com.campusconnect.request.service.LostFoundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lost-found")
@RequiredArgsConstructor
@Tag(name = "Lost and Found", description = "Endpoints for reporting, searching, and managing lost and found campus items")
public class LostFoundController {

    private final LostFoundService lostFoundService;

    @GetMapping
    @Operation(summary = "Browse lost and found items with search & filters")
    public ResponseEntity<Page<LostFoundDto>> getItems(
            @RequestParam(required = false) ItemType itemType,
            @RequestParam(required = false) LostFoundStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(direction, sortParts[0]));

        return ResponseEntity.ok(lostFoundService.getItems(itemType, status, category, search, pageRequest));
    }

    @GetMapping("/my")
    @Operation(summary = "Get lost/found listings submitted by current user")
    public ResponseEntity<List<LostFoundDto>> getMyItems(@AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(lostFoundService.getMyItems(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get item details")
    public ResponseEntity<LostFoundDto> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(lostFoundService.getItemById(id));
    }

    @PostMapping
    @Operation(summary = "Create a lost or found item listing")
    public ResponseEntity<LostFoundDto> createItem(
            @Valid @RequestBody LostFoundDto dto,
            @AuthenticationPrincipal UserContext user) {
        return new ResponseEntity<>(lostFoundService.createItem(dto, user), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an item listing (owner or admin)")
    public ResponseEntity<LostFoundDto> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody LostFoundDto dto,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(lostFoundService.updateItem(id, dto, user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update status (e.g. mark CLAIMED or RESOLVED)")
    public ResponseEntity<LostFoundDto> updateStatus(
            @PathVariable Long id,
            @RequestParam LostFoundStatus status,
            @AuthenticationPrincipal UserContext user) {
        return ResponseEntity.ok(lostFoundService.updateStatus(id, status, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete item listing")
    public ResponseEntity<Map<String, String>> deleteItem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserContext user) {
        lostFoundService.deleteItem(id, user);
        return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
    }
}
