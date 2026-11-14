package com.campusconnect.notification.repository;

import com.campusconnect.notification.document.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    List<ActivityLog> findTop50ByOrderByTimestampDesc();
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
