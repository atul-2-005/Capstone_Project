package com.campusconnect.request.repository;

import com.campusconnect.request.entity.ItemType;
import com.campusconnect.request.entity.LostFoundItem;
import com.campusconnect.request.entity.LostFoundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostFoundRepository extends JpaRepository<LostFoundItem, Long> {

    List<LostFoundItem> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    @Query("SELECT i FROM LostFoundItem i WHERE " +
           "(:itemType IS NULL OR i.itemType = :itemType) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:category IS NULL OR LOWER(i.category) = LOWER(:category)) AND " +
           "(:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(i.location) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LostFoundItem> searchItems(@Param("itemType") ItemType itemType,
                                   @Param("status") LostFoundStatus status,
                                   @Param("category") String category,
                                   @Param("search") String search,
                                   Pageable pageable);
}
