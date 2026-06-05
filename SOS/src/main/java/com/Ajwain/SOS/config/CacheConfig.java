package com.Ajwain.SOS.config;

import java.time.Duration;

import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class CacheConfig {

    // 1. Move the serializer creation out so both beans can safely consume it
    private RedisCacheConfiguration createBaseCacheConfig(Jackson2JsonRedisSerializer<Object> serializer) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(60))
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(serializer));
    }

    @Bean
    public Jackson2JsonRedisSerializer<Object> jackson2JsonRedisSerializer() {
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        BasicPolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType(Object.class)
                .build();

        // Standardizing typing settings safely
        objectMapper.activateDefaultTyping(
                ptv,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );

        return new Jackson2JsonRedisSerializer<>(objectMapper, Object.class);
    }

    @Bean
    public RedisCacheConfiguration cacheConfiguration(Jackson2JsonRedisSerializer<Object> serializer) {
        return createBaseCacheConfig(serializer);
    }

    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer(Jackson2JsonRedisSerializer<Object> serializer) {
        // 2. Explicitly bind your custom base config to the custom TTL values
        RedisCacheConfiguration baseConfig = createBaseCacheConfig(serializer);

        return (builder) -> builder
                .withCacheConfiguration("subjects", baseConfig.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("deadlines", baseConfig.entryTtl(Duration.ofMinutes(20)))
                .withCacheConfiguration("studyplan", baseConfig.entryTtl(Duration.ofMinutes(10)))
                .withCacheConfiguration("dashboard", baseConfig.entryTtl(Duration.ofMinutes(5)));
    }
}