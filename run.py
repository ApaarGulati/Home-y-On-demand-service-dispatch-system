from myapp import create_app

# Call the factory function to manufacture the app
app = create_app()

if __name__ == '__main__':
    # Start the server
    app.run(debug=True)