package com.mocktest.bean.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TicketStatusResponse {
    private Long id;
    @Enumerated(EnumType.STRING)
    private com.mocktest.entities.TicketStatus ticketType;
    private String statusUpdate;
}