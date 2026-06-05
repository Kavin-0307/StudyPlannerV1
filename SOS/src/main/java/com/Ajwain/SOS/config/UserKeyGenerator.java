package com.Ajwain.SOS.config;

import java.lang.reflect.Method;
import java.util.Arrays;

import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Cache key generator that safely reads the authenticated user from
 * SecurityContextHolder at method-call time (not inside a SpEL expression).
 *
 * Usage in service:
 *   @Cacheable(value = "studyplan", keyGenerator = "userKeyGenerator")
 *
 * Generated key format:  <userEmail>:<methodName>:<params...>
 * e.g.  "user@example.com:getTodayPlan"
 *       "user@example.com:getStudyPlans:0:20"
 */
@Component("userKeyGenerator")
public class UserKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        String userIdentifier = resolveUserIdentifier();
        String methodName = method.getName();

        if (params == null || params.length == 0) {
            return userIdentifier + ":" + methodName;
        }

        // Include pageable page/size if present, skip complex objects
        StringBuilder sb = new StringBuilder(userIdentifier).append(":").append(methodName);
        for (Object param : params) {
            if (param == null) continue;
            if (param instanceof org.springframework.data.domain.Pageable p) {
                sb.append(":").append(p.getPageNumber()).append(":").append(p.getPageSize());
            } else if (param instanceof Number || param instanceof String || param instanceof Enum) {
                sb.append(":").append(param);
            }
            // skip complex criteria objects — the user identifier already scopes the cache
        }
        return sb.toString();
    }

    private String resolveUserIdentifier() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return "anonymous";
            }
            Object principal = auth.getPrincipal();
            if (principal instanceof UserDetails ud) {
                return ud.getUsername();
            }
            return principal.toString();
        } catch (Exception e) {
            return "anonymous";
        }
    }
}