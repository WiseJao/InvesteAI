package com.InvesteAI.backend.repository;

import com.InvesteAI.backend.interfaces.UserInterface;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.InvesteAI.backend.model.User;


//Utilizar interface
//@Repository
//public class UserRepository {
//    private final JdbcTemplate jdbcTemplate;
//
//    public UserRepository(JdbcTemplate jdbcTemplate) {
//        this.jdbcTemplate = jdbcTemplate;
//    }
//
//    public User buscarUsuario(Long id) {
//        String sql = "SELECT id, nome, email FROM usuario WHERE id = ?";
//
//        return jdbcTemplate.queryForObject(
//            sql,
//            (rs, rowNum) -> new User(
//                rs.getLong("id"),
//                rs.getString("name"),
//                rs.getString("email")
//            ),
//            id
//        );
//    }
//
//    public void deletarUsuario(Long id){
//        String sql = "DELETE FROM usuario WHERE id = ?";
//        try {
//            jdbcTemplate.update(sql, id);
//        } catch (Exception e) {
//            System.out.println("Erro" + e);
//        }
//    }
//
//    public void criarUsuario(User user){
//        String sql = "INSERT INTO usuario (nome, email) VALUES (?, ?)";
//        try {
//            jdbcTemplate.update(sql, user.getNome(), user.getEmail());
//        } catch (Exception e) {
//            System.out.println("Erro" + e);
//        }
//    }
//
//    public void atualizarUsuario(User user){
//        String sql = "UPDATE usuario SET nome = ?, email = ? where id = ?" ;
//        try {
//            jdbcTemplate.update(sql, user.getNome(), user.getEmail(), user.getId());
//        } catch (Exception e) {
//            System.out.println("Erro" + e);
//        }
//    }
//}