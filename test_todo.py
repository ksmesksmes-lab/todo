import sys
import re
import time
sys.stdout.reconfigure(encoding='utf-8')
from playwright.sync_api import sync_playwright, expect

URL = "http://localhost:3000/todo.html"

def wait_for_app(page):
    # Babel + React CDN 완전 로드 대기
    page.wait_for_selector("h1", state="visible", timeout=15000)
    page.wait_for_function("document.querySelector('input[placeholder]') !== null", timeout=15000)
    time.sleep(0.5)

def add_todo(page, text):
    inp = page.locator("input[placeholder*='입력']")
    inp.fill(text)
    page.keyboard.press("Enter")
    page.wait_for_selector(f"li >> text={text}", timeout=5000)

def run_tests():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(URL)
        wait_for_app(page)

        # 1. 페이지 로드
        try:
            expect(page.locator("h1")).to_have_text("Todo")
            results.append(("PASS", "페이지 로드 및 제목 확인"))
        except Exception as e:
            results.append(("FAIL", f"페이지 로드: {e}"))

        # 2. 빈 상태 메시지
        try:
            page.evaluate("localStorage.clear()")
            page.reload()
            wait_for_app(page)
            expect(page.locator("text=할 일이 없습니다")).to_be_visible(timeout=5000)
            results.append(("PASS", "빈 상태 메시지 표시"))
        except Exception as e:
            results.append(("FAIL", f"빈 상태 메시지: {e}"))

        # 3. Todo 추가 (Enter)
        try:
            add_todo(page, "첫 번째 할 일")
            expect(page.locator("li >> text=첫 번째 할 일")).to_be_visible()
            results.append(("PASS", "Todo 추가 (Enter)"))
        except Exception as e:
            results.append(("FAIL", f"Todo 추가 Enter: {e}"))

        # 4. Todo 추가 (버튼)
        try:
            page.locator("input[placeholder*='입력']").fill("두 번째 할 일")
            page.locator("button", has_text="추가").click()
            page.wait_for_selector("li >> text=두 번째 할 일", timeout=5000)
            expect(page.locator("li >> text=두 번째 할 일")).to_be_visible()
            results.append(("PASS", "Todo 추가 (버튼)"))
        except Exception as e:
            results.append(("FAIL", f"Todo 추가 버튼: {e}"))

        # 5. 빈 입력 추가 거부
        try:
            count_before = page.locator("li").count()
            page.locator("input[placeholder*='입력']").fill("   ")
            page.keyboard.press("Enter")
            time.sleep(0.3)
            assert page.locator("li").count() == count_before
            results.append(("PASS", "빈 입력 추가 거부"))
        except Exception as e:
            results.append(("FAIL", f"빈 입력 거부: {e}"))

        # 6. 완료 토글 (취소선)
        try:
            item = page.locator("li").filter(has_text="첫 번째 할 일")
            item.locator("input[type=checkbox]").click()
            time.sleep(0.3)
            span_class = item.locator("span").get_attribute("class")
            assert "line-through" in span_class, f"line-through not found in: {span_class}"
            results.append(("PASS", "완료 토글 (취소선 표시)"))
        except Exception as e:
            results.append(("FAIL", f"완료 토글: {e}"))

        # 7. 완료 토글 해제
        try:
            item = page.locator("li").filter(has_text="첫 번째 할 일")
            item.locator("input[type=checkbox]").click()
            time.sleep(0.3)
            span_class = item.locator("span").get_attribute("class")
            assert "line-through" not in span_class
            results.append(("PASS", "완료 토글 해제"))
        except Exception as e:
            results.append(("FAIL", f"완료 토글 해제: {e}"))

        # 8. 수정 (버튼 → Enter 저장)
        try:
            # 수정 버튼 클릭 전에 li 인덱스를 확정
            items = page.locator("li")
            target_idx = None
            for i in range(items.count()):
                if "두 번째 할 일" in (items.nth(i).inner_text() or ""):
                    target_idx = i
                    break
            assert target_idx is not None, "두 번째 할 일 항목을 찾을 수 없음"
            items.nth(target_idx).locator("button", has_text="수정").click()
            # 편집 input은 페이지에 하나만 나타남
            edit_input = page.locator("li input[type=text]")
            edit_input.wait_for(state="visible", timeout=5000)
            edit_input.fill("수정된 할 일")
            page.keyboard.press("Enter")
            page.wait_for_selector("li >> text=수정된 할 일", timeout=5000)
            expect(page.locator("li >> text=수정된 할 일")).to_be_visible()
            results.append(("PASS", "Todo 수정 (Enter 저장)"))
        except Exception as e:
            results.append(("FAIL", f"Todo 수정: {e}"))

        # 9. 수정 취소 (Escape)
        try:
            items = page.locator("li")
            target_idx = None
            for i in range(items.count()):
                if "수정된 할 일" in (items.nth(i).inner_text() or ""):
                    target_idx = i
                    break
            assert target_idx is not None, "수정된 할 일 항목을 찾을 수 없음"
            items.nth(target_idx).locator("button", has_text="수정").click()
            edit_input = page.locator("li input[type=text]")
            edit_input.wait_for(state="visible", timeout=5000)
            original = edit_input.input_value()
            edit_input.fill("임시 텍스트")
            page.keyboard.press("Escape")
            time.sleep(0.3)
            expect(page.locator("li >> text=수정된 할 일")).to_be_visible()
            results.append(("PASS", "Todo 수정 취소 (Escape)"))
        except Exception as e:
            results.append(("FAIL", f"수정 취소: {e}"))

        # 10. 통계 표시
        try:
            expect(page.locator("p").filter(has_text="전체")).to_be_visible()
            results.append(("PASS", "통계 텍스트 표시"))
        except Exception as e:
            results.append(("FAIL", f"통계 표시: {e}"))

        # 11. localStorage 저장
        try:
            stored = page.evaluate("JSON.parse(localStorage.getItem('todos'))")
            assert isinstance(stored, list) and len(stored) > 0
            results.append(("PASS", f"localStorage 저장 ({len(stored)}개)"))
        except Exception as e:
            results.append(("FAIL", f"localStorage: {e}"))

        # 12. 새로고침 후 데이터 유지
        try:
            count_before = page.locator("li").count()
            page.reload()
            wait_for_app(page)
            count_after = page.locator("li").count()
            assert count_after == count_before, f"새로고침 전 {count_before}개 → 후 {count_after}개"
            expect(page.locator("li >> text=수정된 할 일")).to_be_visible(timeout=5000)
            results.append(("PASS", "새로고침 후 데이터 유지"))
        except Exception as e:
            results.append(("FAIL", f"새로고침 유지: {e}"))

        # 13. 삭제
        try:
            items = page.locator("li")
            target_idx = None
            for i in range(items.count()):
                if "수정된 할 일" in (items.nth(i).inner_text() or ""):
                    target_idx = i
                    break
            assert target_idx is not None, "삭제할 항목을 찾을 수 없음"
            items.nth(target_idx).locator("button", has_text="삭제").click()
            time.sleep(0.3)
            expect(page.locator("li >> text=수정된 할 일")).not_to_be_visible()
            results.append(("PASS", "Todo 삭제"))
        except Exception as e:
            results.append(("FAIL", f"Todo 삭제: {e}"))

        browser.close()

    # 결과 출력
    print("\n" + "="*50)
    print("  Todo App Test Results")
    print("="*50)
    passed = sum(1 for r in results if r[0] == "PASS")
    failed = sum(1 for r in results if r[0] == "FAIL")
    for status, msg in results:
        print(f"  [{status}] {msg}")
    print("="*50)
    print(f"  Total {len(results)}  |  Pass {passed}  |  Fail {failed}")
    print("="*50)

if __name__ == "__main__":
    run_tests()
