from setuptools import setup, find_packages

setup(
    name='ecommerce-price-scraper',
    version='1.0.0',
    packages=find_packages(),
    install_requires=[
        'fastapi==0.104.1',
        'uvicorn==0.24.0',
        'requests==2.31.0',
        'pandas==2.1.3',
        'pydantic==2.5.2',
        'click==8.1.7',
        'python-dotenv==1.0.0',
        'jinja2==3.1.2',
    ],
    entry_points={
        'console_scripts': [
            'price-scraper=price_scraper:cli',
        ],
    },
    python_requires='>=3.8',
)
