package com.campusconnect.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestStatsDto implements Serializable {
    private static final long serialVersionUID = 1L;

    private long total;
    private long submitted;
    private long assigned;
    private long inProgress;
    private long resolved;
    private long closed;
    private long rejected;

    private Map<String, Long> byCategory;
    private Map<String, Long> byPriority;
}
