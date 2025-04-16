package com.vinitadriveops.app

import android.os.Bundle
import android.widget.Toast
import com.getcapacitor.BridgeActivity
import com.android.volley.Request
import com.android.volley.Response
import com.android.volley.toolbox.JsonObjectRequest
import com.android.volley.toolbox.Volley
import org.json.JSONObject

class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        registerUser()
    }

    private fun registerUser() {
        val url = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
        val queue = Volley.newRequestQueue(this)

        val jsonBody = JSONObject().apply {
            put("action", "register")
            put("name", "Test User")
            put("email", "test@example.com")
            put("phone", "1234567890")
            put("password", "testpass123")
            put("role", "driver")
        }

        val jsonObjectRequest = JsonObjectRequest(
            Request.Method.POST, url, jsonBody,
            { response ->
                Toast.makeText(this, "Registration successful!", Toast.LENGTH_LONG).show()
            },
            { error ->
                Toast.makeText(this, "Error: ${error.message}", Toast.LENGTH_LONG).show()
            }
        )

        queue.add(jsonObjectRequest)
    }
}