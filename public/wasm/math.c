// Pure computation functions — no I/O, no memory allocation, just numbers.

// Recursive fibonacci — intentionally naive O(2^n) to stress-test both runtimes
int fibonacci(int n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// DJB2 hash — classic hash function, processes a number by extracting its digits
unsigned int hash_djb2(unsigned int input) {
  unsigned int hash = 5381;
  while (input > 0) {
    unsigned int digit = input % 10;
    hash = ((hash << 5) + hash) + digit;
    input /= 10;
  }
  return hash;
}

// Count primes — trial division up to max_n
// Nested loops with unpredictable break points, integer division (modulo)
// All computation inside WASM — single call, no boundary overhead
int count_primes(int max_n) {
  int count = 0;
  for (int n = 2; n <= max_n; n++) {
    int is_prime = 1;
    for (int i = 2; i * i <= n; i++) {
      if (n % i == 0) {
        is_prime = 0;
        break;
      }
    }
    count += is_prime;
  }
  return count;
}