"""Modular scrapers package for Conference DateLine."""
from .base import BaseScraper
from .community_feeds import CommunityFeedScraper
from .web_scraper import WebScraper

__all__ = ["BaseScraper", "CommunityFeedScraper", "WebScraper"]

