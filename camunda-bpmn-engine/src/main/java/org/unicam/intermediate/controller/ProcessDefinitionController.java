package org.unicam.intermediate.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.camunda.bpm.engine.RepositoryService;
import org.camunda.bpm.engine.repository.ProcessDefinition;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.unicam.intermediate.models.dto.Response;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/process-definitions")
@RequiredArgsConstructor
@Slf4j
public class ProcessDefinitionController {

    private final RepositoryService repositoryService;

    @GetMapping("/deployed")
    public ResponseEntity<Response<List<Map<String, Object>>>> getDeployedProcessDefinitions() {
        try {
            List<Map<String, Object>> deployed = repositoryService.createProcessDefinitionQuery()
                    .latestVersion()
                    .list()
                    .stream()
                    .sorted(Comparator.comparing(ProcessDefinition::getKey, String.CASE_INSENSITIVE_ORDER))
                    .map(pd -> Map.<String, Object>of(
                            "id", pd.getId(),
                            "key", pd.getKey(),
                            "name", pd.getName() != null ? pd.getName() : "",
                            "version", pd.getVersion(),
                            "deploymentId", pd.getDeploymentId(),
                            "state", pd.isSuspended() ? "SUSPENDED" : "ACTIVE"
                    ))
                    .toList();

            return ResponseEntity.ok(Response.ok(deployed));
        } catch (Exception e) {
            log.error("[Process Definitions API] Failed to retrieve deployed process definitions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.error("Failed to retrieve deployed process definitions: " + e.getMessage()));
        }
    }
}

