package com.campusconnect.user.service;

import com.campusconnect.user.dto.DepartmentDto;
import com.campusconnect.user.entity.Department;
import com.campusconnect.user.exception.BadRequestException;
import com.campusconnect.user.exception.ResourceNotFoundException;
import com.campusconnect.user.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Cacheable(value = "departments")
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDto(dept);
    }

    @CacheEvict(value = "departments", allEntries = true)
    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Department with name '" + dto.getName() + "' already exists");
        }

        Department department = Department.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .build();

        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    @CacheEvict(value = "departments", allEntries = true)
    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (!department.getName().equalsIgnoreCase(dto.getName().trim()) &&
                departmentRepository.existsByNameIgnoreCase(dto.getName().trim())) {
            throw new BadRequestException("Department with name '" + dto.getName() + "' already exists");
        }

        department.setName(dto.getName().trim());
        department.setDescription(dto.getDescription());
        return mapToDto(departmentRepository.save(department));
    }

    @CacheEvict(value = "departments", allEntries = true)
    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    public DepartmentDto mapToDto(Department dept) {
        return DepartmentDto.builder()
                .id(dept.getId())
                .name(dept.getName())
                .description(dept.getDescription())
                .createdAt(dept.getCreatedAt())
                .build();
    }
}
