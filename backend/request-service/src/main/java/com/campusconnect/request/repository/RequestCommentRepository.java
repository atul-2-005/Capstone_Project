package com.campusconnect.request.repository;

import com.campusconnect.request.document.RequestComment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestCommentRepository extends MongoRepository<RequestComment, String> {
    List<RequestComment> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
