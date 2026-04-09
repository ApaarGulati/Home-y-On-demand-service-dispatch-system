import mysql.connector as sq



import mysql.connector as sq

DB_HOST = "127.0.0.1"
DB_NAME = "homey"
DB_USER = "root" 
DB_PASS = "1234"

def last_30_days_transaction():
    query = """
        SELECT transaction_id, booking_id, base_amount, tip_amount, escrow_status, transaction_date 
        FROM payment_transaction 
        WHERE transaction_date >= CURRENT_DATE - INTERVAL 30 DAY;
    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")


def bkg_trnscn(booking_id="BKG-002"):
    query = f"""
        SELECT * FROM payment_transaction
        WHERE booking_id="{booking_id}";
    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        if(len(transactions)==0):
            print("none found")
            return
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")


def wrk_trnscn(worker_id="WRK-01"):
    query = f"""
        SELECT * FROM payment_transaction 
        JOIN booking ON payment_transaction.booking_id = booking.booking_id
        WHERE booking.worker_id = "{worker_id}"
    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        if(len(transactions)==0):
            print("none found")
            return
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")


def usr_trnscn(user_id="USR-02"):
    query = f"""
        SELECT * FROM payment_transaction 
        JOIN booking ON payment_transaction.booking_id = booking.booking_id
        WHERE booking.user_id = "{user_id}";

    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        if(len(transactions)==0):
            print("none found")
            return
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")



def sum_money(worker_id="WRK-01"):
    query = f"""
        SELECT 
        SUM(payment_transaction.base_amount) AS total_base,
        SUM(payment_transaction.tip_amount) AS total_tips,
        SUM(payment_transaction.base_amount + payment_transaction.tip_amount) AS grand_total
    FROM payment_transaction
        JOIN booking ON payment_transaction.booking_id = booking.booking_id
    WHERE booking.worker_id = "{worker_id}"
    AND payment_transaction.escrow_status = 'RELEASED'; 


    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        if(len(transactions)==0):
            print("none found")
            return
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")


def dist_services():
    query = f"""
        SELECT DISTINCT * FROM services;
    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")




def cumulative_trnscn(amount=10000):
    query = f"""
        SELECT
    transaction_id,
    booking_id,
    base_amount,
    tip_amount,
    (base_amount + tip_amount) AS net_amount,
    escrow_status
FROM payment_transaction
    WHERE (base_amount + tip_amount) > {amount}
        ORDER BY net_amount DESC;


    """
    
    # Initialize variables so the 'finally' block doesn't throw an error if connection fails
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True) 
        
        cur.execute(query)
        transactions = cur.fetchall()
        if(len(transactions)==0):
            print("none found")
            return
        for row in transactions:
            print(row) 

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None:
            cur.close()
        if conn is not None and conn.is_connected():
            conn.close()
            print("Database connection closed.")



# 15
def get_users_with_multiple_workers():
    query = """
        SELECT DISTINCT b1.user_id 
        FROM booking b1, booking b2 
        WHERE b1.user_id = b2.user_id AND b1.worker_id != b2.worker_id;
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query)
        users = cur.fetchall()
        
        for row in users:
            print(f"User ID: {row['user_id']}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()

# 14
def get_account_balances():
    query = """
        SELECT account.email, wallet.current_balance
        FROM wallet
        JOIN account ON wallet.account_id = account.account_id;
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query)
        balances = cur.fetchall()
        
        print("--- Account Balances ---")
        for row in balances:
            print(f"Email: {row['email']} | Balance: {row['current_balance']}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()


# 13
def count_accounts_per_role():
    query = """
        SELECT role_type, COUNT(*) AS total_count
        FROM account
        GROUP BY role_type;
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query)
        role_counts = cur.fetchall()
        
        print("--- Account Counts by Role ---")
        for row in role_counts:
            print(f"Role: {row['role_type']} | Total Count: {row['total_count']}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()


#10
def get_average_review(worker_id):  # use WRK-01 to showcase :)
    query = """
        SELECT COALESCE(rating_sum / NULLIF(rating_count, 0), 0) AS avg_rating 
        FROM worker 
        WHERE worker_id = %s;
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query, (worker_id,))
  
        result = cur.fetchone()
        
        if result: print(f"Worker {worker_id} Average Rating: {result['avg_rating']}")
        else: print(f"No worker found with ID: {worker_id}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()


#9    get_worker_transaction_history('WRK-01') 
def get_worker_transaction_history(worker_id):
    query = """
        SELECT base_amount, tip_amount, escrow_status, transaction_date
        FROM payment_transaction 
        WHERE booking_id IN (
            SELECT booking_id FROM booking WHERE worker_id = %s 
        );
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query, (worker_id,))
        transactions = cur.fetchall()
        
        print(f"--- Transaction History for Worker: {worker_id} ---")
        
        if not transactions:
            print("No transactions found for this worker.")
        else:
            for row in transactions:
                # Formatting the output for readability beacuse i can ;-;
                print(f"Date: {row['transaction_date']} | Base: {row['base_amount']} | Tip: {row['tip_amount']} | Status: {row['escrow_status']}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()

#8
def get_user_transaction_history(user_id):
    # 'USR-01' 
    query = """
        SELECT base_amount, tip_amount, escrow_status, transaction_date
        FROM payment_transaction 
        WHERE booking_id IN (
            SELECT booking_id FROM booking WHERE user_id = %s 
        );
    """
    
    conn = None
    cur = None
    
    try:
        conn = sq.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
        cur = conn.cursor(dictionary=True)
        
        cur.execute(query, (user_id,))
        transactions = cur.fetchall()
        
        print(f"--- Transaction History for User: {user_id} ---")
        
        if not transactions:
            print("No transactions found for this user.")
        else:
            for row in transactions:
                print(f"Date: {row['transaction_date']} | Base: {row['base_amount']} | Tip: {row['tip_amount']} | Status: {row['escrow_status']}")

    except sq.Error as err:
        print(f"Database error: {err}")
        
    finally:
        if cur is not None: cur.close()
        if conn is not None and conn.is_connected(): conn.close()






# last_30_days_transaction()
# bkg_trnscn()
# wrk_trnscn()
#usr_trnscn()
#sum_money()
#dist_services()
# cumulative_trnscn()
# get_user_transaction_history("USR-01")
#get_worker_transaction_history("WRK-01")
get_average_review("WRK-01")
#count_accounts_per_role()
#get_account_balances()
#get_users_with_multiple_workers()