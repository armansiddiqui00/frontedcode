  // signature.service.ts
  import { Injectable } from '@angular/core';
  import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class SignatureService {

  private privateKey: string = ''; // This is a demonstration. Never expose your private key in production!
 
 
  
  // *Important:* In a real application, never hard-code secret keys.
  private secretKey: string ="MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDAYHVOT4s9iyu+j/44VN1pyrjp8xr2mJH1qLUcpmYYXtfdh4IFDEXYTHQW2GvI4q/0fUEvm4j5x5kmMFjHlIgcxEIlmWeGRHOJr2r1JB9RZTl3rgzpGL8Da98eBLOrXnul9VQ7g/G+QEo9MM0cCkpAoyWk7o+nSVva9OuMvR58tpTYKC6a2PdCvmUB2DSQQU7pXU2zph52QFV2UTgAq0DvfsdPvsKg30f2nn67PxYCHJSBcDi318gVmTYIexsW2JBtbMUF7J+Z++K/QIL+9jWSIb9pPCS91dfq5VP8I+iW0uVW1m3yGXOHAyZYqcsN88fl2JiOGxCK6yy4AwIgW0yhAgMBAAECggEACarvSjuyHionzSBUYMVXCTGAYHVwpfLd5vAPBf0QxWnCxGXCcXl/6xJQhTNkG0jVGd7Pj1JsLE1NE3+7fnAm9Pch8dzHOJapDcLMh7xEfKUvIaYUDQTK2KOrp0kKNHL/mMP+8yy60dpOQMv6is2zlJL+Wc8JVhlYLeVADycT6KV307hFQAAoa3qC3tIpze0iNLZ/vM8Y4NAs+uvqkAGoZsehENlX3b1RLRjwyZHc7bL++eBL0mL8hKp2KPWlLoeV66Y2k2avVygp6hmm2jJ8+ClryaTlII6pnu+M4MDEgCHPfWzjbLktCr85VjH4a9IbJtqka1OvRZ62rQVVLvxxCQKBgQD7dAnJVvCBqpdgPPZX49DqCFKXmDx/txINTYdAdPlGvwzm48Qk2tlMGTLhJ0Gy2IX6rV6dJ3Mzg0WbGdwkav82b0EVnNpL5Y9wWd9WjYj56Fr2JfXBV/NBOyLZHcxZETb83qI8E08kMwvWkzy4f9vMoAOHloKVA1K+itQCTqmhVQKBgQDD2vVlXFxl698rh6sNrLdFwrYvYQgYPnUl1aCJ6kYsrdGwgO8YgD9as2YbEg3npX5z1DP8v/BiEynqzf1ul+QLCnrzffXcA77fbdjNUI9N4QLp03yVQ8dKvOHvjglsZXGnKLJcQz87eWkjlq/pBnRnPcO2JLWLon2hOeQ/QovuHQKBgQDcRYA1McWpsQi+M2kRAO6HtRa02ZVVw8c6hAnROycLBF2G/UtbhaMI+KILflodE3P6blkNjftqyrn07qhb9qbuxnLbPfY0ujn3D6OHrKCrWxIjwokP/72GDQmv7FyQQXZL+bNgsQGJEnZyV7S/YrHnBN1Sr1RguPKJHBAwnTwXqQKBgDod5AmS0Zww1MU++cQSB0Q9FgCTI2rGRc7XSE8EZJRnc7yTVd+IVsRcTaUkw1mEozRNuKt8bSE9HIgfXd+OVM3t6zQLoYQK3H3CQ74Q9KUgatPlvKcyOJX13HlQRX2T0JjQm7SDA+VrDobP9R0JnEryafvHgtOPgQXxfshCv/EFAoGBAPnD7YazwxqESdJ2HDgjNUjoR8/IYRqGZNjkIISBU4al6qQYaPpHuN982b6hq1fK/KGHJxHWSCpMDvh1/bQ8u9Yam0vPVj567DOF2hpr+nKEn5FDRmr/dtiUFuQDwYrn6y8P9bUb4fbE8Zn4qcSvu3xEJ06zBn8+6mycy/IlxOsJ" //"H5mFwjFHIQZ3QhVBYPvYbg==MTIzNDK1";//;

  // Method to sign the payload
  signPayload(payload: any): string { 
    // Step 1: Serialize the payload to JSON with consistent key ordering 
    const stringifiedPayload =this.stringifyWithSortedKeys(payload); //JSON.stringify(payload);
    console.log("stringifiedPayload ",stringifiedPayload)
    // Step 2: Generate SHA-256 hash of the payload
    const hash = CryptoJS.SHA256(stringifiedPayload).toString(CryptoJS.enc.Hex);
      
//console.log("Hash ", hash);
    // Step 3: Generate HMAC-SHA256 signature
    const signature = CryptoJS.HmacSHA256(hash, this.secretKey).toString(CryptoJS.enc.Base64);
    
    return signature;
  }

  // Utility method to stringify JSON with sorted keys
  public stringifyWithSortedKeys(obj: any): string {
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.stringifyWithSortedKeys(item)).join(',') + ']';
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    for (const key of sortedKeys) {
      sortedObj[key] = obj[key];
    }
    return JSON.stringify(sortedObj);
  }

}