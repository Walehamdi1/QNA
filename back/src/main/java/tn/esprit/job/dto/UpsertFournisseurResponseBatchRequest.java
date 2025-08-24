package tn.esprit.job.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpsertFournisseurResponseBatchRequest {
    List<UpsertFournisseurResponseRequest> items;
}