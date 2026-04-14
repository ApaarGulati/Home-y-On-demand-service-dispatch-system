##this is the main file where the app is created and is run 

from myapp import create_app
from dotenv import load_dotenv  # <-- 1. Add this import

# <-- 2. Tell Python to load the .env file into the system!
load_dotenv()
# Call the factory function to manufacture the app
app = create_app()

if __name__ == '__main__':
    # Start the server
    app.run(debug=True)


