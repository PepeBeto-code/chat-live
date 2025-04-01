package com.chat.api.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DemoController {
    @PostMapping("/demo")
    public  Map<String, String> welcome(){
        Map<String, String> response = new HashMap<>();
        response.put("message", "endpoint seguro");
        return response;    }
}
