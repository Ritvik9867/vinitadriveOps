package com.vinitadriveops.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import com.vinitadriveops.app.databinding.ActivityLoginBinding
import org.json.JSONObject

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.btnLogin.setOnClickListener {
            val email = binding.etEmail.text.toString()
            val password = binding.etPassword.text.toString()

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            performLogin(email, password)
        }
    }

    private fun performLogin(email: String, password: String) {
        val queue = Volley.newRequestQueue(this)
        val url = "https://script.google.com/macros/s/AKfycbxyz.../exec"

        val jsonBody = JSONObject().apply {
            put("email", email)
            put("password", password)
        }

        val request = JsonObjectRequest(
            Request.Method.POST, url, jsonBody,
            { response ->
                val success = response.optBoolean("success", false)
                if (success) {
                    val intent = Intent(this, MainActivity::class.java).apply {
                        putExtra("email", email)
                    }
                    startActivity(intent)
                    finish()
                } else {
                    val message = response.optString("message", "Login failed")
                    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
                }
            },
            { error ->
                Toast.makeText(
                    this,
                    "Error: ${error.message ?: "Unknown error"}",
                    Toast.LENGTH_SHORT
                ).show()
            }
        )

        queue.add(request)
    }
}