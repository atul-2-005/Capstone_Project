package com.campusconnect.request.service;

import com.campusconnect.request.dto.LostFoundDto;
import com.campusconnect.request.entity.ItemType;
import com.campusconnect.request.entity.LostFoundItem;
import com.campusconnect.request.entity.LostFoundStatus;
import com.campusconnect.request.exception.ForbiddenException;
import com.campusconnect.request.exception.ResourceNotFoundException;
import com.campusconnect.request.repository.LostFoundRepository;
import com.campusconnect.request.security.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostFoundService {

    private final LostFoundRepository lostFoundRepository;

    @Transactional
    public LostFoundDto createItem(LostFoundDto dto, UserContext user) {
        LostFoundItem item = LostFoundItem.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .category(dto.getCategory().trim())
                .itemType(dto.getItemType())
                .location(dto.getLocation().trim())
                .imageUrl(dto.getImageUrl())
                .ownerId(user.getId())
                .ownerName(user.getName() != null ? user.getName() : user.getEmail())
                .contactInfo(dto.getContactInfo() != null ? dto.getContactInfo() : user.getEmail())
                .status(LostFoundStatus.REPORTED)
                .build();

        return mapToDto(lostFoundRepository.save(item));
    }

    @Transactional(readOnly = true)
    public Page<LostFoundDto> getItems(ItemType type, LostFoundStatus status, String category, String search, Pageable pageable) {
        return lostFoundRepository.searchItems(type, status, category, search, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<LostFoundDto> getMyItems(UserContext user) {
        return lostFoundRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LostFoundDto getItemById(Long id) {
        LostFoundItem item = lostFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return mapToDto(item);
    }

    @Transactional
    public LostFoundDto updateItem(Long id, LostFoundDto dto, UserContext user) {
        LostFoundItem item = lostFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        if (!item.getOwnerId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("You can only edit your own listings");
        }

        item.setTitle(dto.getTitle().trim());
        item.setDescription(dto.getDescription().trim());
        item.setCategory(dto.getCategory().trim());
        item.setLocation(dto.getLocation().trim());
        if (dto.getImageUrl() != null) item.setImageUrl(dto.getImageUrl());
        if (dto.getContactInfo() != null) item.setContactInfo(dto.getContactInfo());
        if (dto.getStatus() != null) item.setStatus(dto.getStatus());

        return mapToDto(lostFoundRepository.save(item));
    }

    @Transactional
    public LostFoundDto updateStatus(Long id, LostFoundStatus status, UserContext user) {
        LostFoundItem item = lostFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        if (!item.getOwnerId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("You are not authorized to update this listing's status");
        }

        item.setStatus(status);
        return mapToDto(lostFoundRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id, UserContext user) {
        LostFoundItem item = lostFoundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        if (!item.getOwnerId().equals(user.getId()) && !"ADMIN".equalsIgnoreCase(user.getRole())) {
            throw new ForbiddenException("You are not authorized to delete this listing");
        }

        lostFoundRepository.deleteById(id);
    }

    public LostFoundDto mapToDto(LostFoundItem i) {
        return LostFoundDto.builder()
                .id(i.getId())
                .title(i.getTitle())
                .description(i.getDescription())
                .category(i.getCategory())
                .itemType(i.getItemType())
                .location(i.getLocation())
                .imageUrl(i.getImageUrl())
                .ownerId(i.getOwnerId())
                .ownerName(i.getOwnerName())
                .contactInfo(i.getContactInfo())
                .status(i.getStatus())
                .createdAt(i.getCreatedAt())
                .build();
    }
}
