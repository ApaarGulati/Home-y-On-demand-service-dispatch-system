import secrets
import string

def generate_id(prefix: str, total_length: int = 20):
    """
    Generates a secure, prefixed ID.
    Example: generate_id("BK", 20) -> 'BK_7H2W9L4N5X1Z...'
    """
    # 1. Define a clean alphabet (No 'O', '0', 'I', or '1' to avoid confusion)
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    
    # 2. Account for the prefix and the underscore
    actual_prefix = f"{prefix.upper()}_"
    random_length = total_length - len(actual_prefix)
    
    if random_length <= 0:
        raise ValueError(f"Prefix '{actual_prefix}' is too long for total length {total_length}")

    # 3. Generate secure random string
    random_str = ''.join(secrets.choice(alphabet) for _ in range(random_length))
    
    return f"{actual_prefix}{random_str}"