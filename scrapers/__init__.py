"""Modular scrapers package for Conference DateLine."""
from .base import BaseScraper
from .community_feeds import CommunityFeedScraper, HciDeadlinesScraper
from .sigchi import SigchiScraper
from .web_scraper import WebScraper
from .wikicfp import WikiCfpScraper

__all__ = [
    "BaseScraper",
    "CommunityFeedScraper",
    "HciDeadlinesScraper",
    "SigchiScraper",
    "WebScraper",
    "WikiCfpScraper",
]
