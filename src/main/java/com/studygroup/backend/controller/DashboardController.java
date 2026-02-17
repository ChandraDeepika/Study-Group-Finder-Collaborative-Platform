 
package com.studygroup.backend.controller;

import com.studygroup.backend.dto.DashboardResponse;
import com.studygroup.backend.service.DashboardService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public DashboardResponse getDashboard(Authentication authentication) {
        return dashboardService.getDashboardData(authentication.getName());
    }
}
