package com.InvesteAI.backend.model;


public class User {
    private Long id;
    private String nome;
    private String email;

    public User(Long id, String nome, String email) {
        this.id = id;
        this.nome = nome;
        this.email = email;
    }
    public User() {
    }
    
    public Long getId() {
        return id;
    }
    public String getNome() {
        return nome;
    }
    public void setNome(String nome) {
        this.nome = nome;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

}

