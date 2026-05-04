package com.Ajwain.SOS.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.stereotype.Component;
import com.Ajwain.SOS.auth.CurrentUserService;

@Component
public class UserContextCleanupFilter implements Filter {

    private final CurrentUserService currentUserService;

    public UserContextCleanupFilter(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        try {
            chain.doFilter(request, response);
        } finally {
            currentUserService.clear(); // 🔥 important
        }
    }
}